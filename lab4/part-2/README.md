#### Crack SHA1

```shell
# Dict + rules
hashcat --potfile-disable --force -m 100 -a 0 -r password.rule -o password-set-1-cracked.txt password-set-1.txt rockyou.txt
```

_Crack time_: 2 hours

#### Crack SHA1 ($pass.$salt)

```shell
# Dict
hashcat --potfile-disable --force -m 110 -a 0 -o password-set-2-cracked.txt password-set-2.txt rockyou.txt
```

_Crack time_: 2 days (25 years using rules)

#### Crack MD5

```shell
# Dict + rules
hashcat --potfile-disable --force -m 0 -a 0 -r password.rule -o password-set-3-cracked.txt password-set-3.txt rockyou.txt
```

_Crack time_: 1 hour


