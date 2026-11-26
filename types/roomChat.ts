export type RoomChatLine = {
  text: string;
  role: string;
  at: number;
};

export type RoomChatRole = "host" | "join";