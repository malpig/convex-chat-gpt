import { query, mutation } from "./_generated/server";

export const list = query(async ({ db }) => {
  const messages = await db.query("messages").collect();
  return Promise.all(
    messages.map(async (message) => {
      if (message.identityId) {
        const identity = await db.get(message.identityId);
        message.identityName = identity.name;
      }
      return message;
    })
  );
});

export const send = mutation(
  async ({ db, scheduler }, body, identityName, threadId) => {
    const myMessageId = await db.insert("messages", {
      body,
      author: "user",
      threadId,
    });

    const { instructions, _id: identityId } = await db
      .query("identities")
      .filter((q) => q.eq(q.field("name"), identityName))
      .unique();
    if (!instructions) console.error("Unknown identity: " + identityName);
    const botMessageId = await db.insert("messages", {
      author: "assistant",
      threadId,
      identityId,
    });
    const messages = await db
      .query("messages")
      .order("desc")
      .filter((q) => q.eq(q.field("error"), null))
      .filter((q) => q.eq(q.field("threadId"), threadId))
      .filter((q) => q.neq(q.field("body"), null))
      .take(10);
    messages.reverse();
    scheduler.runAfter(
      0,
      "actions/openai:gpt3",
      instructions ?? "You are a helpful assistant.",
      messages,
      botMessageId
    );
  }
);

export const update = mutation(async ({ db }, messageId, patch) => {
  await db.patch(messageId, patch);
});