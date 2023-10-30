import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateUserDto, PaginationDto, UpdateUserDto, User, Users } from '@app/common';
import { randomUUID } from 'crypto';
import { NotFoundError, Observable, Subject } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly users: User[] = [];

  onModuleInit() {
    for (let i = 0; i < 10; i ++) {
      this.create({ username: randomUUID(), password: randomUUID(), age: 0 })
    }
  }

  create(createUserDto: CreateUserDto): User {
    const user: User = {
      ...createUserDto,
      subscribe: false,
      socialMedia: {},
      id: randomUUID()
    }

    this.users.push(user)

    return user
  }

  findAll(): Users {
    return ({ users: this.users })
  }

  findOne(id: string): User {
    return this.users.find(user => user.id == id)
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const userIndex = this.users.findIndex(user => user.id == id)

    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        ...updateUserDto
      }
      return this.users[userIndex]
    }

    throw new NotFoundError('user not found')
  }

  remove(id: string): User {
    const userIndex = this.users.findIndex(user => user.id == id)

    if (userIndex !== -1) {
      return this.users.splice(userIndex)[0];
    }

    throw new NotFoundError('user not found')
  }

  queryUsers (paginationDtoStream: Observable<PaginationDto>): Observable<Users> {
    const subject = new Subject<Users>();

    const onNext = (paginationDto: PaginationDto) => {
      const start = paginationDto.page * paginationDto.skip
      subject.next({
        users: this.users.slice(start, start + paginationDto.skip)
      })
    }

    const onComplete = () => subject.complete()
    paginationDtoStream.subscribe({
      next: onNext,
      complete: onComplete
    })

    return subject.asObservable()
  }
}