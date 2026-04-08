import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(data: any) {
    const hashed = data.password ? await bcrypt.hash(data.password, 10) : null;
    return this.usersService.create({ ...data, password: hashed });
  }

  async login(data: any) {
    const user = await this.usersService.findOneByEmail(data.email); // ✅ utiliser findOneByEmail
    if (!user) throw new Error('Utilisateur non trouvé');
    if (!user.password) throw new Error('Compte social, utilisez Google/Facebook/LinkedIn');
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new Error('Mot de passe incorrect');
    return { token: 'JWT_FAKE_TOKEN', user };
  }
}