import { Metadata } from 'next'
import { Github, Mail, MapPin, Calendar } from 'lucide-react'
import { Navigation } from '@/components/ui/Navigation'

export const metadata: Metadata = {
  title: 'Avi Lezerovich - Software Developer',
  description: 'Personal story of Avi Lezerovich, software developer and tech entrepreneur from Israel',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="relative mb-8">
              <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {/* Photo placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-6xl text-gray-600 font-bold">A.L</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Avi Lezerovich
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-6 font-light">
              Software Developer • Tech Entrepreneur • Former Egoz Unit Fighter
            </p>
            
            {/* Quick Info */}
            <div className="flex flex-wrap justify-center gap-4 text-gray-500 text-sm mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Herzliya, Israel</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>4th Year Computer Science Student</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/Avi-Lezerovich"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 hover:scale-105"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <a
                href="mailto:avi.lezerovich@example.com"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Me</span>
              </a>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 border border-white/50">
            <div className="prose prose-lg max-w-none" dir="rtl" style={{ fontFamily: '"Heebo", "Noto Sans Hebrew", system-ui, sans-serif' }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">הסיפור שלי</h2>
              
              <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
                <p>
                  הדרך שלי התחילה בצפת, במשפחה חרדית עם שבעה אחים. עד גיל 14 גדלתי בעולם של תלמוד תורה, ללא מקצועות ליבה, עד שגירושי ההורים שינו הכל. פתאום מצאתי את עצמי עובר לגור עם אחי, ולראשונה בחיי נכנס לבית ספר חילוני עם מתמטיקה, אנגלית ומדעים.
                </p>

                <p>
                  בגיל 17, בשנת הלימודים האחרונה של התיכון, כבר שכרתי דירה וניהלתי כלכלה עצמאית. זה לא היה קל - ללמוד, לעבוד, לשלם שכר דירה ולסגור פערים בו זמנית. אבל משהו בתוכי אמר שאני יכול. סיימתי עם תעודת בגרות מלאה עם הרחבה באלקטרוניקה ומחשבים.
                </p>

                <p>
                  אחרי המכינה הקדם צבאית "מעשה בגליל", שם התחנכתי להתנדבות ותרומה לקהילה, הגעתי לשירות הצבאי. בתור חייל בודד חסר עורף משפחתי, התגייסתי ליחידת אגוז. השירות שם עיצב אותי - למדתי מה זה להיות לוחם, עבדתי על פיתוח רחפנים, וגיליתי את האהבה שלי לטכנולוגיה. במקביל לקחתי קורס במכללת IITC לניהול רשתות - הפעם הראשונה שלמדתי אנגלית באמת הייתה בגיל 20.
                </p>

                <p>
                  אחרי השחרור נסעתי לחמישה חודשים להרצות הברית, שם המשכתי ללמוד אנגלית והרחבתי את האופקים. כשחזרתי לארץ התחלתי לעבוד בחברת סטארט-אפ - שנה לפני הלימודים ושנה נוספת במהלכם. שם למדתי איך צוותי תוכנה ואלקטרוניקה באמת מתנהלים, ומה האתגרים האמיתיים של פיתוח מוצר.
                </p>

                <p>
                  הגיע הזמן לקפוץ למים העמוקים - לימודי מדעי המחשב. קיבלתי מלגת קרן אור באוניברסיטת רייכמן, תוכנית שמיועדת לסטודנטים מהפריפריה החברתית ללא עורף משפחתי וכלכלי. זו הייתה לא רק הזדמנות ללמוד, אלא הזדמנות לבנות גשר בין מי שהייתי למי שאני יכול להיות.
                </p>

                <p>
                   מצאתי את עצמי רוצה לתת יותר. בלימודים הפכתי לחונך לסטודנטים צעירים יותר, עזרתי לחברים שלי בקורסים. בעבודתי כאיש IT יזמתי העברת מחשבים נייחים מהחברה לסטודנטים בקרן אור שזקוקים להם, וגייסתי תרומות נוספות. לא מתוך חובה, אלא מתוך הבנה שכל אחד מאיתנו יכול להיות הגשר לחלומות של מישהו אחר.
                </p>

                <p>
                  היום אני בשנה האחרונה לתואר, חלק מתוכנית רבין למנהיגות, גר בהרצליה עם בת הזוג שלי. אני עדיין אוהב לרוץ - רצתי כבר שני מרתונים, ויש משהו בריצה הארוכה שמזכיר לי את החיים. הדרך ארוכה, צריך סבלנות והתמדה, וזה לא על הזמן אלא על זה להגיע לקו הסיום.
                </p>

                <p>
                  בטכנולוגיה אני מוצא את התשוקה שלי לפתור בעיות אמיתיות - מהמדפסת התלת-מימדית הנזרקת שהחייתי לחיים, ועד מערכת הבית החכם שבניתי. כל פרויקט הוא הזדמנות לקחת משהו שבור ולהפוך אותו למשהו שעובד.
                </p>

                <p className="text-xl font-semibold text-blue-700 bg-blue-50 p-4 rounded-lg">
                  המסע שלי לימד אותי שהמקום ממנו אתה מגיע לא מגביל אותך - הוא מעצים אותך. כל הקשיים שעברתי, כל הפערים שמילאתי, כל האבדן שחוויתי - כל זה הפך אותי למישהו שמבין שהטכנולוגיה היא לא רק קוד, היא דרך לשנות חיים.
                </p>


              </div>
            </div>
          </div>

          {/* Skills & Experience */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Skills</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'JavaScript', 'TypeScript', 'React', 'Next.js',
                  'Node.js', 'Python', 'PostgreSQL', 'MongoDB',
                  'Docker', 'AWS', 'Git', 'Linux'
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium text-center hover:bg-blue-200 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Education & Experience</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-400 pl-4">
                  <h4 className="font-semibold text-gray-900">Reichman University</h4>
                  <p className="text-gray-600">B.Sc. Computer Science</p>
                  <p className="text-sm text-gray-500">Or Foundation Scholarship</p>
                </div>
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-gray-900">Egoz Special Forces Unit</h4>
                  <p className="text-gray-600">Fighter & Developer</p>
                  <p className="text-sm text-gray-500">Drone systems development</p>
                </div>
                <div className="border-l-4 border-purple-400 pl-4">
                  <h4 className="font-semibold text-gray-900">Rabin Leadership Program</h4>
                  <p className="text-gray-600">Leadership Development</p>
                  <p className="text-sm text-gray-500">Mentoring & Community Development</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-3xl font-bold mb-4">
                Let's Connect
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Interested in collaborating or just want to chat about technology?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:avi.lezerov@gmail.com"
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 font-semibold shadow-lg"
                >
                  Send me an email
                </a>
                <a
                  href="https://github.com/Avi-Lezerovich"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all duration-200 hover:scale-105 font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  My Projects
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}