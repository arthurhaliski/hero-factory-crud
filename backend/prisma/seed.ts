import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpa os dados existentes (opcional, remova se não quiser limpar)
  await prisma.hero.deleteMany({});
  console.log('Dados existentes removidos.');

  // Cria heróis iniciais
  const heroes = [
    {
      name: 'Bruce Wayne',
      nickname: 'Batman',
      dateOfBirth: new Date('1978-02-19'),
      universe: 'DC',
      mainPower: 'Inteligência e tecnologia',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Clark Kent',
      nickname: 'Superman',
      dateOfBirth: new Date('1980-04-18'),
      universe: 'DC',
      mainPower: 'Super força e vôo',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Diana Prince',
      nickname: 'Mulher Maravilha',
      dateOfBirth: new Date('1985-07-22'),
      universe: 'DC',
      mainPower: 'Força e reflexos sobre-humanos',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Tony Stark',
      nickname: 'Homem de Ferro',
      dateOfBirth: new Date('1975-05-29'),
      universe: 'Marvel',
      mainPower: 'Inteligência e armadura tecnológica',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Steve Rogers',
      nickname: 'Capitão América',
      dateOfBirth: new Date('1920-07-04'),
      universe: 'Marvel',
      mainPower: 'Força e agilidade aumentadas',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Barry Allen',
      nickname: 'Flash',
      dateOfBirth: new Date('1989-03-14'),
      universe: 'DC',
      mainPower: 'Super velocidade',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Peter Parker',
      nickname: 'Homem-Aranha',
      dateOfBirth: new Date('1995-08-10'),
      universe: 'Marvel',
      mainPower: 'Agilidade e sentido aranha',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Natasha Romanoff',
      nickname: 'Viúva Negra',
      dateOfBirth: new Date('1984-11-22'),
      universe: 'Marvel',
      mainPower: 'Artes marciais e espionagem',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Arthur Curry',
      nickname: 'Aquaman',
      dateOfBirth: new Date('1979-01-29'),
      universe: 'DC',
      mainPower: 'Comunicação com vida marinha e super força',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Carol Danvers',
      nickname: 'Capitã Marvel',
      dateOfBirth: new Date('1968-03-17'),
      universe: 'Marvel',
      mainPower: 'Absorção e manipulação de energia',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Hal Jordan',
      nickname: 'Lanterna Verde',
      dateOfBirth: new Date('1976-02-20'),
      universe: 'DC',
      mainPower: 'Anel de poder',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Wanda Maximoff',
      nickname: 'Feiticeira Escarlate',
      dateOfBirth: new Date('1989-12-21'),
      universe: 'Marvel',
      mainPower: 'Manipulação da realidade',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Oliver Queen',
      nickname: 'Arqueiro Verde',
      dateOfBirth: new Date('1982-05-16'),
      universe: 'DC',
      mainPower: 'Arqueria e habilidades táticas',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'T\'Challa',
      nickname: 'Pantera Negra',
      dateOfBirth: new Date('1977-07-01'),
      universe: 'Marvel',
      mainPower: 'Força, agilidade e traje de vibranium',
      avatarUrl: '',
      isActive: true,
    },
    {
      name: 'Victor Stone',
      nickname: 'Ciborgue',
      dateOfBirth: new Date('1990-10-15'),
      universe: 'DC',
      mainPower: 'Força sobre-humana e tecnologia cibernética',
      avatarUrl: '',
      isActive: true,
    }
  ];

  for (const hero of heroes) {
    await prisma.hero.create({
      data: hero
    });
  }

  console.log(`Seed concluído. ${heroes.length} heróis criados.`);
}

main()
  .catch((e) => {
    console.error('Erro durante o processo de seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 