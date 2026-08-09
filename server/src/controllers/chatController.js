import * as chatService from "../services/chatService.js";
import * as userRepo from "../repository/userRepo.js";

const MAX_MESSAGE = 5000;

export const getMessages = async (req, res, next) => {
  try {
    res.json(await chatService.getConversation(req.userId, req.params.id));
  } catch (err) {
    next(err);
  }
};

export const postMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Message text is required." });
    }
    if (text.length > MAX_MESSAGE) {
      return res.status(400).json({ error: `Message too long (max ${MAX_MESSAGE} characters).` });
    }

    // The AI addresses the person by name, so fetch it for the prompt.
    const user = await userRepo.findById(req.userId);
    const journalId = req.params.id === "new" ? null : req.params.id;

    const result = await chatService.sendMessage(req.userId, journalId, text.trim(), {
      userName: user?.name || "",
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
