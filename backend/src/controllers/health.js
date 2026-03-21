export const getHealth = (req, res) => {
  res.json({
    status: 'ok',
    message: 'Personal Chatbot API is running',
    version: 'v1'
  });
};
