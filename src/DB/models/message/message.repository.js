
import { Message } from "./message.model.js";
import { DBRepository } from "../db.repository.js";

class MessageRepository extends DBRepository {
  constructor() {
    super(Message);
  }
}

export const messageRepository = new MessageRepository();