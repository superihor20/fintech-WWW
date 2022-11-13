import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { Profile } from '../../entities';

import { ProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async create(profileDto: ProfileDto) {
    return this.profileRepository.save(profileDto);
  }

  private async findOneBy(
    filters: FindOptionsWhere<Profile>,
  ): Promise<Profile> {
    const foundProfile = await this.profileRepository.findOneBy(filters);

    if (!foundProfile) {
      throw new NotFoundException();
    }

    return foundProfile;
  }

  async findOne(id: number): Promise<Profile> {
    return this.findOneBy({ id });
  }

  async update(id: number, profileDto: ProfileDto) {
    const foundProfile = await this.findOne(id);
    this.profileRepository.merge(foundProfile, profileDto);

    return this.profileRepository.save(foundProfile);
  }
}
