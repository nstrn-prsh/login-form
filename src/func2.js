generateParticles({
    numParticles: 225,
    radius: 3,
    vel: {
        x: [0.1, 0.5],
        y: [0.1, 0.6],
    },
    lineColor: "rgba(202, 206, 228, 1)",
    particleColor: "rgba(202, 206, 228, 1)",
    maxConnections: 5,
    maxConnectDistance: 3,
    canvasSelector: "#canvas",
});

function generateParticles(props) {
    const {
        numParticles,
        vel,
        maxConnections,
        maxConnectDistance,
        radius,
        lineColor,
        particleColor,
        canvasSelector,
    } = props;
    const canvas = document.querySelector(canvasSelector);
    const ctx = canvas.getContext("2d");
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    class Particle {
        constructor(pos, radius) {
            const calcVel = (min, max) => {
                const vel = Math.random() * max + min;
                const posOrNeg = Math.random() > 0.5 ? vel : -vel;
                return posOrNeg;
            };
            const { x, y } = vel;
            this.pos = pos;
            this.velX = calcVel(x[0], x[1]);
            this.velY = calcVel(y[0], y[1]);
            this.closestPoints;
            this.radius = radius;
            this.color = particleColor;
            this.lines = [];
            this.closestSwitch = (() => {
                if (!maxConnections) {
                    return (array) =>
                        array.filter(
                            (particle) => particle.distFromOrigin < maxConnectDistance
                        );
                } else {
                    return (array) =>
                        array
                        .sort((a, b) => a.distFromOrigin - b.distFromOrigin)
                        .slice(1, maxConnections + 1);
                }
            })();
        }
        getClosest() {
            const x1 = this.pos.x;
            const y1 = this.pos.y;
            let closestPoints = cloud.points.map((point) => {
                const x2 = point.pos.x;
                const y2 = point.pos.y;
                const getDist = (val2, val1) => {
                    let output = val2 - val1;
                    if (output < 0) output = output.toString().replace("-", "");
                    return output;
                };
                const distX = getDist(x2, x1);
                const distY = getDist(y2, y1);
                const squareVals = Math.pow(distX, 2) + Math.pow(distY, 2);
                const finalDist = Math.sqrt(squareVals);
                return Object.assign(point, {
                    distFromOrigin: finalDist,
                });
            });
            this.closestPoints = this.closestSwitch(closestPoints);
        }
        update() {
            this.lines = [];
            this.getClosest(); // gets the three closest points
            this.closestPoints.forEach((point) => {
                const startPos = {
                    x: this.pos.x,
                    y: this.pos.y,
                };
                // console.log(point);
                const endPos = {
                    x: point.pos.x,
                    y: point.pos.y,
                };
                this.lines.push(new Line(startPos, endPos));
                this.lines.forEach((line) => line.update());
            });
            // Checks to see if the point is at the edge of canvas and changes velocity direction
            if (this.pos.x < 0 || this.pos.x > canvas.clientWidth)
                this.velX = -this.velX;
            if (this.pos.y < 0 || this.pos.y > canvas.clientHeight)
                this.velY = -this.velY;
            this.pos.x += this.velX;
            this.pos.y += this.velY;
            this.draw();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    class Line {
        constructor(startPos, endPos) {
            this.startPos = startPos;
            this.endPos = endPos;
            this.color = lineColor;
        }
        update() {
            this.draw();
        }
        draw() {
            ctx.beginPath();
            ctx.moveTo(this.startPos.x, this.startPos.y);
            ctx.lineTo(this.endPos.x, this.endPos.y);
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
    }
    class PointCloud {
        constructor(amtPoints) {
            this.amtPoints = amtPoints;
            this.points = [];
            for (let i = 0; i < amtPoints; i++) {
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;
                const x = Math.random() * width;
                const y = Math.random() * height;
                this.points.push(
                    new Particle({
                            x,
                            y,
                        },
                        radius
                    )
                );
            }
        }
        update() {
            this.points.forEach((point) => point.update());
        }
        draw() {}
    }
    const cloud = new PointCloud(numParticles);

    function animate() {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        cloud.update();
        requestAnimationFrame(animate);
    }
    animate();
    console.log(cloud);
}