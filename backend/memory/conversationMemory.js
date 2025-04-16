const Conversation = require('../models/Conversation');

async function getUserConversation(userId) {
  const convo = await Conversation.findOne({ userId });
  return convo ? convo.history : [];
}

async function saveUserMessage(userId, newMessage) {
  const convo = await Conversation.findOneAndUpdate(
    { userId },
    {
      $push: { history: newMessage },
      $set: { updatedAt: new Date() }
    },
    { upsert: true, new: true }
  );
  return convo.history;
}

module.exports = {
  getUserConversation,
  saveUserMessage
};
