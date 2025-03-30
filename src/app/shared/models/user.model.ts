
export class UserModel {
  constructor(
    public uid: string,
    public username: string,
    public password: string,
    public role: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public contact: string,
    public department: string
  ) {}
}
