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
      avatarUrl: 'https://raw.githubusercontent.com/gilbarbara/logos/master/logos/batman.svg',
      isActive: true,
    },
    {
      name: 'Clark Kent',
      nickname: 'Superman',
      dateOfBirth: new Date('1980-04-18'),
      universe: 'DC',
      mainPower: 'Super força e vôo',
      avatarUrl: 'https://raw.githubusercontent.com/gilbarbara/logos/master/logos/superman.svg',
      isActive: true,
    },
    {
      name: 'Diana Prince',
      nickname: 'Mulher Maravilha',
      dateOfBirth: new Date('1985-07-22'),
      universe: 'DC',
      mainPower: 'Força e reflexos sobre-humanos',
      avatarUrl: 'https://raw.githubusercontent.com/gilbarbara/logos/master/logos/wonder-woman.svg',
      isActive: true,
    },
    {
      name: 'Tony Stark',
      nickname: 'Homem de Ferro',
      dateOfBirth: new Date('1975-05-29'),
      universe: 'Marvel',
      mainPower: 'Inteligência e armadura tecnológica',
      avatarUrl: 'https://raw.githubusercontent.com/gilbarbara/logos/master/logos/ironman.svg',
      isActive: true,
    },
    {
      name: 'Steve Rogers',
      nickname: 'Capitão América',
      dateOfBirth: new Date('1920-07-04'),
      universe: 'Marvel',
      mainPower: 'Força e agilidade aumentadas',
      avatarUrl: 'https://raw.githubusercontent.com/gilbarbara/logos/master/logos/captain-america.svg',
      isActive: true,
    },
    {
      name: 'Barry Allen',
      nickname: 'Flash',
      dateOfBirth: new Date('1989-03-14'),
      universe: 'DC',
      mainPower: 'Super velocidade',
      avatarUrl: 'https://raw.githubusercontent.com/gilbarbara/logos/master/logos/flash.svg',
      isActive: true,
    },
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