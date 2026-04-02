require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');

const services = [
    {
        title: 'Гранд Отель Алматы',
        description: 'Роскошный пятизвёздочный отель в самом сердце Алматы. Предлагаем просторные номера с видом на горы, спа-центр, 3 ресторана и бизнес-центр.',
        category: 'hotel',
        price: 35000,
        currency: 'KZT',
        location: 'Алматы, пр. Достык 88',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        rating: 4.8,
        reviewCount: 324,
        capacity: 2,
        amenities: ['WiFi', 'Завтрак', 'Бассейн', 'Спа', 'Парковка', 'Фитнес'],
        isActive: true,
    },
    {
        title: 'Boutique Hotel Nomad',
        description: 'Уютный бутик-отель с казахским колоритом. Идеально для путешественников, ценящих аутентичность и комфорт.',
        category: 'hotel',
        price: 18000,
        currency: 'KZT',
        location: 'Алматы, ул. Панфилова 52',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
        rating: 4.5,
        reviewCount: 198,
        capacity: 2,
        amenities: ['WiFi', 'Завтрак', 'Терраса', 'Кофе'],
        isActive: true,
    },
    {
        title: 'Ресторан "Дастархан"',
        description: 'Традиционная казахская кухня в современном интерьере. Столик на двоих с живой музыкой и специальным меню.',
        category: 'restaurant',
        price: 8500,
        currency: 'KZT',
        location: 'Алматы, ул. Абая 12',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        rating: 4.7,
        reviewCount: 512,
        capacity: 4,
        amenities: ['Живая музыка', 'Парковка', 'Доставка'],
        isActive: true,
    },
    {
        title: 'Jazz Café "Алатау"',
        description: 'Атмосферное кафе с живым джазом каждые выходные. Изысканная европейская кухня и большой выбор вин.',
        category: 'restaurant',
        price: 5500,
        currency: 'KZT',
        location: 'Алматы, ул. Гоголя 34',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        rating: 4.6,
        reviewCount: 287,
        capacity: 2,
        amenities: ['Живой джаз', 'Бар', 'Веранда'],
        isActive: true,
    },
    {
        title: 'Концерт: Dimash Қудайберген',
        description: 'Грандиозный концерт мирового певца Димаша в Almaty Arena. Уникальное шоу с LED-экранами и спецэффектами.',
        category: 'event',
        price: 25000,
        currency: 'KZT',
        location: 'Алматы, Almaty Arena',
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
        rating: 5.0,
        reviewCount: 1024,
        capacity: 1,
        amenities: ['VIP-зона', 'Meet & Greet', 'Мерч'],
        isActive: true,
    },
    {
        title: 'Фестиваль "Астана Наурыз"',
        description: 'Ежегодный фестиваль Наурыз с традиционными играми, концертами и ярмаркой. Семейное мероприятие.',
        category: 'event',
        price: 3000,
        currency: 'KZT',
        location: 'Астана, Парк «Expo»',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        rating: 4.4,
        reviewCount: 756,
        capacity: 4,
        amenities: ['Детская зона', 'Еда', 'Игры', 'Концерт'],
        isActive: true,
    },
    {
        title: 'Бизнес-класс Алматы → Астана',
        description: 'Перелёт Air Astana бизнес-классом. Включает приоритетную посадку, Premium lounge и питание.',
        category: 'transport',
        price: 45000,
        currency: 'KZT',
        location: 'Аэропорт Алматы → Аэропорт Астана',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
        rating: 4.6,
        reviewCount: 423,
        capacity: 1,
        amenities: ['Бизнес-класс', 'Lounge', 'Питание', 'WiFi'],
        isActive: true,
    },
    {
        title: 'VIP Трансфер в аэропорт',
        description: 'Комфортный трансфер на Mercedes S-Class с личным водителем. Встреча с табличкой.',
        category: 'transport',
        price: 12000,
        currency: 'KZT',
        location: 'По всей Алматы',
        image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
        rating: 4.9,
        reviewCount: 201,
        capacity: 3,
        amenities: ['Mercedes S-Class', 'Вода', 'WiFi', 'Кондиционер'],
        isActive: true,
    },
];

const seedDB = async () => {
    try {
        await connectDB();
        await Service.deleteMany();
        await User.deleteMany();
        await Booking.deleteMany();

        // Create admin user
        const admin = await User.create({
            name: 'Администратор',
            email: 'admin@booking.kz',
            password: 'admin123',
            role: 'admin',
            phone: '+7 777 000 0001',
        });

        // Create demo user
        const demoUser = await User.create({
            name: 'Данела Смагулова',
            email: 'user@booking.kz',
            password: 'user1234',
            phone: '+7 701 234 5678',
        });

        // Create services
        await Service.insertMany(services);
        const allServices = await Service.find();

        // Create demo bookings
        await Booking.create({
            user: demoUser._id,
            service: allServices[0]._id,
            checkIn: new Date('2025-05-10'),
            checkOut: new Date('2025-05-13'),
            guests: 2,
            totalPrice: 105000,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: 'card',
            paymentTransactionId: 'TXN-DEMO001',
        });

        await Booking.create({
            user: demoUser._id,
            service: allServices[4]._id,
            checkIn: new Date('2025-06-01'),
            checkOut: new Date('2025-06-01'),
            guests: 1,
            totalPrice: 25000,
            status: 'pending',
            paymentStatus: 'unpaid',
        });

        console.log('✅ База данных заполнена!');
        console.log('👤 Admin: admin@booking.kz / admin123');
        console.log('👤 User:  user@booking.kz  / user1234');
        process.exit(0);
    } catch (err) {
        console.error('❌ Ошибка:', err.message);
        process.exit(1);
    }
};

seedDB();
