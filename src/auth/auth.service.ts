import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import mongoose, { Model } from 'mongoose';


import * as bcryptjs from 'bcryptjs';

import { RegisterUserDto, CreateUserDto, UpdateAuthDto, LoginDto,} from './dto';

import { User } from './entities/user.entity';

import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { UserResponse } from './interfaces/user-response';



@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) 
    private userModel: Model<User>,

    private jwtService: JwtService,
   ) {}

  
  async create(createUserDto: CreateUserDto): Promise<User> {
    
    try {
      
      const { password, ...userData } = createUserDto;
           
      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      });

       await newUser.save();
       const { password:_, ...user } = newUser.toJSON();
       
       return user;
      
    } catch (error) {
      if( error.code === 11000 ) {
        throw new BadRequestException(`${ createUserDto.email } already exists!`)
      }
      throw new InternalServerErrorException('Something terribe happen!!!');
    }

  }

  async register( registerDto: RegisterUserDto ): Promise<LoginResponse> {

    const user = await this.create( registerDto );

    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    }
  }


  async login( loginDto: LoginDto ):Promise<LoginResponse> {

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if ( !user ) {
      throw new UnauthorizedException('Not valid credentials - email');
    }
    
    if ( !bcryptjs.compareSync( password, user.password ) ) {
      throw new UnauthorizedException('Not valid credentials - password');
    }

    const { password:_, ...rest  } = user.toJSON();

      
    return {
      user: rest,
      token: this.getJwtToken({ id: user.id })
    }
  
  }
   

  async update2(id: string, updateAuthDto: UpdateAuthDto): Promise<void> {
  try {
    // Verifica si la contraseña está presente en updateAuthDto
    if (updateAuthDto.password ==="000000") {
     
      delete updateAuthDto.password;
    } else {
     
       // Hash de la contraseña solo si está presente y no es una cadena vacía
       const hashedPassword = bcryptjs.hashSync(updateAuthDto.password, 10);
       updateAuthDto.password = hashedPassword;
    }

    // Busca al usuario por su ID
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Actualiza el usuario con los nuevos datos
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateAuthDto, { new: true });

  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new BadRequestException('Invalid user ID');
    }
    // Mejora en el manejo de errores: Agrega mensajes de error más específicos
    if (error.message.includes('password')) {
      throw new BadRequestException('La contraseña no puede ser una cadena vacía.');
    }
    // Añade un caso específico para manejar errores relacionados con el campo isActive
    if (error.message.includes('isActive')) {
      throw new BadRequestException('El campo isActive no es válido.');
    }
    throw new InternalServerErrorException('Ocurrió un error al actualizar el usuario');
  }
}

  async update(id: string, updateAuthDto: UpdateAuthDto): Promise<LoginResponse> {
    try {
      
      if (updateAuthDto.password) {
        
        const hashedPassword = bcryptjs.hashSync(updateAuthDto.password, 10);
        updateAuthDto.password = hashedPassword;
      }
  
      
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      
      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateAuthDto, { new: true });
  
      
      const token = this.getJwtToken({ id: updatedUser._id });
  
      
      return {
        user: updatedUser,
        token: token
      };
      
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid user ID');
      }
      throw new InternalServerErrorException('Something went wrong while updating the user');
    }
  }


  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string ) {
    
    const user = await this.userModel.findById( id );
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  async findOne(id: string): Promise<UserResponse> {
    return await this.userModel.findOne({ _id: id });
  }

  


 async remove(id: string): Promise<void> {
  try {
     
     const user = await this.userModel.findById(id);
     if (!user) {
       throw new BadRequestException('Invalid user ID', id);
     }
 
     
     const result = await this.userModel.deleteOne({ _id: id });
     if (result.deletedCount === 0) {
       throw new InternalServerErrorException('Something went wrong while trying to delete the user');
     }
  } catch (error) {
     if (error.name === 'CastError' && error.kind === 'ObjectId') {
       throw new BadRequestException('Invalid user ID, catch');
     }
     throw new InternalServerErrorException('Something went wrong while trying to delete the user');
  }
 }





  getJwtToken( payload: JwtPayload ) {
    const token = this.jwtService.sign(payload);
    return token;
  }

}
