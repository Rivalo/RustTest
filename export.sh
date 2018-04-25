#!/bin/sh
ApplicationName="hello_world"
PiUserName="pi"
PiAddress="raspberrypi.local"

echo "Cross Compile to Raspberry Pi Script v0.1"
echo "Author: Rivalo"
while true; do
    read -p "Adding Cross Compilation Utils to PATH? [y/n]"  yn
    case $yn in
        [Yy]* ) export PATH=$PATH:/b/Rust/Compiler; break;;
        [Nn]* ) echo "WARNING: No Path Added!"; break;;
        * ) echo "Please answer yes or no.";;
    esac
done


echo "Compiling for ARMv6 Raspberry Pi..."
cargo build --target==arm-unknown-linux-gnueabihf
echo "Removing Old Files"
ssh $PiUserName@$PiAddress rm $ApplicationName
ssh $PiUserName@$PiAddress rm -rf static
echo "Transferring to Raspberry Pi..." 
scp target/arm-unknown-linux-gnueabihf/debug/$ApplicationName $PiUserName@$PiAddress:$ApplicationName
scp -r static $PiUserName@$PiAddress:/home/pi/static
echo "Making Executable..."
ssh $PiUserName@$PiAddress chmod +x $ApplicationName
echo "Done, SSH in Raspberry and run application"

