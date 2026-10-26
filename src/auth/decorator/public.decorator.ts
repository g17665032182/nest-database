import { SetMetadata } from '@nestjs/common';
export const IS_PUBILC_KEY = 'isPubilc';
export const Public = () => SetMetadata(IS_PUBILC_KEY, true);
