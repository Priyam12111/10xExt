t = "None"


def f1():
    global t
    t = "Hello"


def f2():
    print(t)


f1()
f2()
