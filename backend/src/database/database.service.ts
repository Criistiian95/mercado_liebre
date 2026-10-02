import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { Commerce } from './models/commerce.model';
import { User } from './models/user.model';
import { Session } from './models/session.model';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly sequelize: Sequelize;

  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is required');
    }

    this.sequelize = new Sequelize(url, {
      dialect: 'mysql',
      logging: false,
      define: {
        timestamps: true,
      },
    });

    Commerce.register(this.sequelize);
    User.register(this.sequelize);
    Session.register(this.sequelize);

    Commerce.hasMany(User, {
      foreignKey: 'commerceId',
      as: 'users',
    });
    User.belongsTo(Commerce, {
      foreignKey: 'commerceId',
      as: 'commerce',
    });
    User.hasMany(Session, {
      foreignKey: 'userId',
      as: 'sessions',
    });
    Session.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }

  async onModuleInit() {
    await this.sequelize.authenticate();

    // Desarrollo inicial: crea tablas faltantes sin alterar las existentes.
    // Antes de producción se reemplaza por migraciones versionadas.
    if (process.env.NODE_ENV !== 'production') {
      await this.sequelize.sync();
    }
  }

  async onModuleDestroy() {
    await this.sequelize.close();
  }
}
