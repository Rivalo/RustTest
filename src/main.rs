#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket;

#[macro_use]
extern crate rocket_contrib;
#[macro_use]
extern crate serde_derive;
extern crate rocket_cors;

use rocket::config::{Config, Environment};
use rocket::response::NamedFile;
use rocket::State;
use rocket::{Request, Response};
use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::{Header, ContentType, Method};
use rocket_contrib::{Json, Value};

use std::collections::HashMap;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

type LedHashMap = HashMap<usize, LED>;
type LedMap = Mutex<LedHashMap>;

#[derive(Serialize, Deserialize, Debug)]
struct LED {
    r: u8,
    g: u8,
    b: u8,
}

pub struct CORS();

impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to requests",
            kind: Kind::Response
        }
    }

    fn on_response(&self, request: &Request, response: &mut Response) {
        if request.method() == Method::Options || response.content_type() == Some(ContentType::JSON) {
            response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
            response.set_header(Header::new("Access-Control-Allow-Methods", "PUT, GET, OPTIONS"));
            response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
            response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
        }

    }
}



#[get("/")]
fn index() -> io::Result<NamedFile> {
    NamedFile::open("static/index.html")
}

#[get("/src/<file..>")]
fn files(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("static/").join(file)).ok()
}

#[get("/led/<id>", format = "application/json")]
fn getled(id: usize, map: State<LedMap>) -> Option<Json<LED>> {
    let hashmap = map.lock().unwrap();
    hashmap.get(&id).map(|leds| {
        Json(LED {
            r: leds.clone().r,
            g: leds.clone().g,
            b: leds.clone().b,
        })
    })
}

#[put("/led/<id>", format = "application/json", data = "<message>")]
fn setled(id: usize, message: Json<LED>, map: State<LedMap>) -> Option<Json<Value>> {
    let mut hashmap = map.lock().unwrap();

    if hashmap.contains_key(&id) {
        hashmap.insert(id, message.0);
        led_update_handler(id, hashmap.get(&id).unwrap());
        Some(Json(json!({ "status": "ok" })))
    } else {
        None
    }
}

#[get("/led", format = "application/json")]
fn amountled(map: State<LedMap>) -> Option<Json<Value>> {
    let hashmap = map.lock().unwrap();
    let length = hashmap.len();
    Some(Json(json!({ "length": length })))
}

fn led_update_handler(id: usize, led: &LED) {
    println!("LED {} HAS BEEN UPDATED", id);
    println!("{:?}", led)
}

fn main() {
    let mut leds = LedHashMap::new();
    let led1 = LED { r: 255, g: 255, b: 255 };

    let led2 = LED { r: 0, g: 0, b: 0 };

    leds.insert(1, led1);
    leds.insert(2, led2);

    let led_map = LedMap::new(leds);

    //Development
    #[cfg(target_os = "windows")]
    let config = Config::build(Environment::Staging)
        .address("localhost")
        .port(8000)
        .unwrap();

    //Release
    #[cfg(target_os = "linux")]
    let config = Config::build(Environment::Staging)
        .address("192.168.178.100")
        .port(80)
        .unwrap();

    
    rocket::custom(config, true)
        .mount("/", routes![index, getled, setled, amountled, files])
        .manage(led_map)
        .attach(CORS())
        .launch();
}
