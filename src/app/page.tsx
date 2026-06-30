'use client'

import Link from 'next/link'
import { WHATSAPP_LINK } from '@/lib/supabase'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-indigo-50" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full opacity-30 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-100 rounded-full opacity-30 translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative max-w-2xl mx-auto px-5 pt-12 pb-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">M</span>
            </div>
            <div>
              <div className="text-xs text-brand-600 font-semibold uppercase tracking-wider">Dr. Pallavi Agarwal</div>
              <div className="text-lg font-bold text-gray-900 leading-tight">Pallavi Mam Maths Classes</div>
            </div>
          </div>

          {/* Hero headline */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-3 text-balance">
              Making Maths<br />
              <span className="text-brand-600">Click for Every Child</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              25 years of teaching excellence. Class 9th–12th CBSE.
              <span className="text-green-700 font-semibold"> 100% pass results</span> — every year.
            </p>
          </div>

          {/* CTA */}
          <a
            href={WHATSAPP_LINK}
            className="btn-primary inline-flex items-center gap-2 text-base shadow-lg shadow-orange-200"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </a>
          <p className="text-xs text-gray-400 mt-3">Opens WhatsApp — no calls needed</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-brand-600 text-white">
        <div className="max-w-2xl mx-auto px-5 py-5 grid grid-cols-3 divide-x divide-orange-500">
          <div className="text-center px-2">
            <div className="text-2xl font-extrabold">25+</div>
            <div className="text-xs text-orange-200 mt-0.5">Years teaching</div>
          </div>
          <div className="text-center px-2">
            <div className="text-2xl font-extrabold">100%</div>
            <div className="text-xs text-orange-200 mt-0.5">Pass results</div>
          </div>
          <div className="text-center px-2">
            <div className="text-2xl font-extrabold">9–12</div>
            <div className="text-xs text-orange-200 mt-0.5">CBSE Classes</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-2xl mx-auto px-5 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why students love it here</h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              icon: '🎓',
              title: 'PhD in Mathematics',
              desc: 'Deep subject expertise, not just exam coaching. Build real understanding.',
            },
            {
              icon: '📐',
              title: 'CBSE focused curriculum',
              desc: 'Chapter-by-chapter coverage aligned with the latest CBSE syllabus.',
            },
            {
              icon: '💻',
              title: 'Online & offline batches',
              desc: 'Flexible learning — attend from home or in person at our centre.',
            },
            {
              icon: '📊',
              title: 'Regular test & feedback',
              desc: 'Frequent tests with detailed result sheets shared with parents.',
            },
            {
              icon: '👨‍👩‍👧',
              title: 'Small batch size',
              desc: 'Personal attention to every student. No large impersonal classes.',
            },
            {
              icon: '✅',
              title: '100% pass record',
              desc: 'Zero failures to date. We make sure every student clears their boards.',
            },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="text-2xl flex-shrink-0 w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{f.title}</div>
                <div className="text-sm text-gray-500 mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classes offered */}
      <div className="bg-indigo-50 py-10">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Classes offered</h2>
          <div className="grid grid-cols-2 gap-3">
            {['9th', '10th', '11th', '12th'].map((cls) => (
              <div key={cls} className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
                <div className="text-3xl font-extrabold text-deep-600">Class {cls}</div>
                <div className="text-sm text-gray-500 mt-1">CBSE Mathematics</div>
                <div className="mt-3 flex gap-1">
                  <span className="badge badge-orange">Online</span>
                  <span className="badge badge-blue">Offline</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="max-w-2xl mx-auto px-5 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About Dr. Pallavi Agarwal</h2>
        <div className="flex gap-4 items-start">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">PA</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">Dr. Pallavi Agarwal</div>
            <div className="text-sm text-brand-600 font-medium">Ph.D. Mathematics</div>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              With a doctorate in Mathematics and 25 years of dedicated teaching,
              Dr. Pallavi Agarwal has helped hundreds of students not just pass their
              boards — but genuinely love the subject. Her patient, concept-first
              approach builds a foundation that serves students through college and beyond.
            </p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Find us</h2>
          <div className="card">
            <div className="flex gap-3 mb-4">
              <div className="text-2xl">📍</div>
              <div>
                <div className="font-semibold text-gray-900">Pallavi Mam Maths Classes</div>
                <div className="text-sm text-gray-600 mt-1 leading-relaxed">
                  B-1105, Shipra Krishna Vista<br />
                  Indirapuram, Ghaziabad<br />
                  Uttar Pradesh — 201014
                </div>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/search/B-1105+Shipra+Krishna+Vista+Indirapuram+Ghaziabad"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm inline-flex items-center gap-2 w-full justify-center"
            >
              <span>🗺️</span> Open in Maps
            </a>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-2xl mx-auto px-5 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to get started?</h2>
        <p className="text-gray-500 mb-6">Message us on WhatsApp and we'll get back to you.</p>
        <a
          href={WHATSAPP_LINK}
          className="btn-primary inline-flex items-center gap-2 text-base shadow-lg shadow-orange-200"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Chat on WhatsApp
        </a>
        <p className="text-xs text-gray-400 mt-3">
          Opens WhatsApp with a ready message — just tap Send
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <div className="font-semibold text-gray-900 mb-1">Pallavi Mam Maths Classes</div>
          <div className="text-sm text-gray-500">Dr. Pallavi Agarwal · Ph.D. Mathematics</div>
          <div className="text-xs text-gray-400 mt-3">
            Indirapuram, Ghaziabad · CBSE Class 9–12
          </div>
          <div className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-4">
            <Link href="/admin" className="hover:text-brand-600 transition-colors">Admin</Link>
            <span>·</span>
            <a href={WHATSAPP_LINK} className="hover:text-brand-600 transition-colors">WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
