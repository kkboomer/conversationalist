import turtle
screen = turtle.Screen()
t = turtle.Turtle()
turtle.tracer(0, 0)


def draw_face(data):
    t.speed(0)
    t.hideturtle()
    face(data)
    eyebrows(data)
    eyes(data)
    nose(data)
    mouth(data)

    turtle.update()        # draw everything instantly
    turtle.done()

    canvas = screen.getcanvas()
    canvas.postscript(file="face.eps")
    screen.bye()

def getXY(data, id) :
    return data["landmarks"][id]["x"] * 500 - 250, (data["landmarks"][id]["y"] * 700 - 350) * -1

def draw(data, origin, dest):
    t.penup()
    setposition(data, origin)
    t.pendown()
    for i in range(origin, dest + 1) :
        x, y = getXY(data, i)
        t.goto(x, y)
    t.penup()

def setposition(data, id) :
    t.penup()
    x, y = getXY(data, id)
    t.setpos(x, y)
    t.pendown()
    
def drawLine(data, origin, dest):
    setposition(data, origin)
    t.pendown()
    x, y = getXY(data, dest)
    t.goto(x, y)
    t.penup()

def drawLoop(data, origin, dest):
    draw(data, origin, dest)
    drawLine(data, dest, origin)

def face(data):
    draw(data, 0, 16)
    drawLine(data, 0, 68)
    draw(data, 68, 74)
    drawLine(data, 16, 74)
    t.penup()

def eyebrows(data):
    draw(data, 17, 21)
    draw(data, 22, 26)

def eyes(data):
    drawLoop(data, 36, 41)
    drawLoop(data, 76, 83)
    drawLoop(data, 42, 47)
    drawLoop(data, 85, 92)
    t.penup()
    setposition(data, 75)
    t.dot(3, "black")
    t.penup()
    setposition(data, 84)
    t.dot(3, "black")
    t.penup()

def nose(data):
    draw(data, 27, 30)
    draw(data, 31, 35)
    drawLine(data, 33, 30)

def mouth(data):
    drawLoop(data, 48, 59)
    drawLoop(data, 60, 67)
