module.exports = async function (context, req) {
    const randomNum = Math.floor(Math.random() * 100); // random number 0-99

    context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
            message: "Hello from Function 1!",
            randomNum: randomNum
        }
    };
};
