const { Engine, Render, Runner, World, Bodies } = Matter;

const width = 600;
const height = 600;
const borderSize = 40;

const engine = Engine.create();
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
