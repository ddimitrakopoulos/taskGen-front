module.exports = async function (context, req) {
  const randomNum = Math.floor(Math.random() * 5000);
  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: { message: "Greetings from Function 2!", randomNum }
  };
};
