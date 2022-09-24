const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 5;
const cellsVertical = 5;
const width = window.innerWidth - 10;
const height = window.innerHeight - 10;
const borderSize = 6;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine,
    options: {
        wireframes: false,
        width,
        height,
    },
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, borderSize, {
        isStatic: true,
        render: {
            fillStyle: "red",
        },
    }),
    Bodies.rectangle(width, height / 2, borderSize, height, {
        isStatic: true,
        render: {
            fillStyle: "red",
        },
    }),
    Bodies.rectangle(width / 2, height, width, borderSize, {
        isStatic: true,
        render: {
            fillStyle: "red",
        },
    }),
    Bodies.rectangle(0, height / 2, borderSize, height, {
        isStatic: true,
        render: {
            fillStyle: "red",
        },
    }),
];

World.add(world, walls);

// Maze generation
const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
};

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
    // If i have visited the cell at [row, column], then return
    if (grid[row][column]) {
        return;
    }
    // Mark this cell as being visited
    grid[row][column] = true;
    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, "up"],
        [row, column + 1, "right"],
        [row + 1, column, "down"],
        [row, column - 1, "left"],
    ]);
    // For each neighbor...
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;

        // See if that neighbor is out of bounds
        if (
            nextRow < 0 ||
            nextRow >= cellsVertical ||
            nextColumn < 0 ||
            nextColumn >= cellsHorizontal
        ) {
            continue;
        }
        // If we have visited that neighbor, continue to nex neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }
        // Remove a wall from either horizontals or verticals

        if (direction === "left") {
            verticals[row][column - 1] = true;
        } else if (direction === "right") {
            verticals[row][column] = true;
        } else if (direction === "up") {
            horizontals[row - 1][column] = true;
        } else if (direction === "down") {
            horizontals[row][column] = true;
        }

        // Visit that next cell
        stepThroughCell(nextRow, nextColumn);
    }
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) return;
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                label: "wall",
                isStatic: true,
                render: {
                    fillStyle: "red",
                },
            }
        );
        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) return;
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
                label: "wall",
                isStatic: true,
                render: {
                    fillStyle: "red",
                },
            }
        );
        World.add(world, wall);
    });
});

//Goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.4,
    unitLengthX * 0.4,
    {
        label: "goal",
        isStatic: true,
        render: {
            fillStyle: "cyan",
        },
    }
);
World.add(world, goal);

//Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
    label: "ball",
    render: {
        fillStyle: "limegreen",
    },
});

World.add(world, ball);

document.addEventListener("keydown", (e) => {
    const { x, y } = ball.velocity;
    if (e.key === "ArrowUp") {
        Body.setVelocity(ball, { x, y: -5 });
    }
    if (e.key === "ArrowRight") {
        Body.setVelocity(ball, { x: +5, y });
    }
    if (e.key === "ArrowDown") {
        Body.setVelocity(ball, { x, y: +5 });
    }
    if (e.key === "ArrowLeft") {
        Body.setVelocity(ball, { x: -5, y });
    }
});

// Win condition
Events.on(engine, "collisionStart", (e) => {
    e.pairs.forEach((collision) => {
        const labels = ["ball", "goal"];
        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            document.querySelector(".winner").classList.remove("hidden");
            world.gravity.y = 1;
            world.bodies.forEach((body) => {
                if (body.label === "wall") {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});
