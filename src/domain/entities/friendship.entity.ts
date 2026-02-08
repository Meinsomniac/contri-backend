export class Friendship {
  public readonly id: string;
  public userId: string;
  public friendId: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(id: string, userId: string, friendId: string) {
    this.id = id;
    this.userId = userId;
    this.friendId = friendId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
