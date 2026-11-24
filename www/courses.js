'use strict';
/* Реєстр курсів. Курс = клас + предмет; зони/задачі підключаються пакетом.
   Новий курс: додати запис сюди й зареєструвати його зони (поле zones). */
const COURSES=[
 {id:'phys7',grade:7,subj:'Фізика',icon:'⚡',color:'#38bdf8',book:'«Фізика 7», Ранок, 2024',ready:true,zones:ZONES},
 {id:'math5',grade:5,subj:'Математика',icon:'➗',color:'#fbbf24',book:'Математика 5 клас',ready:false,zones:[]}
];
