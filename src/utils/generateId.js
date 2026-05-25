const Counter = require("../models/Counter");

module.exports = async (guildId) => {
  let counter = await Counter.findOne({ guildId });

  if (!counter) {
    counter = await Counter.create({ guildId, currentId: 0 });
  }

  counter.currentId++;
  await counter.save();

  return String(counter.currentId).padStart(3, "0");
};
