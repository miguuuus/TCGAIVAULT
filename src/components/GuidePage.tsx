import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './icons';

// More detailed SVG for a good example image
const goodExampleImageUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQyMCIgdmlld0JveD0iMCAwIDMwMCA0MjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnb29kR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzA2YjZkNDtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0ZjQ2ZTU7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0MjAiIGZpbGw9IiMxZTI5M2IiLz48cmVjdCB4PSIyNSIgeT0iMzUiIHdpZHRoPSIyNTAiIGhlaWdodD0iMzUwIiByeD0iMTIiIGZpbGw9IiMwZjE3MmEiIHN0cm9rZT0iIzMzNDE1NSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iNDAiIHk9IjUwIiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnb29kR3JhZCkiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNTAiIHI9IjUwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTUwIiByPSIzMCIgZmlsbD0iI2Y4ZmFmYyIvPjxyZWN0IHg9IjQwIiB5PSIyNjUiIHdpZHRoPSIyMjAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMWUyOTNiIiAvPjxyZWN0IHg9IjU1IiB5PSIyODAiIHdpZHRoPSIxOTAiIGhlaWdodD0iMTAiIGZpbGw9IiM0NzU1NjkiIHJ4PSI1Ii8+PHJlY3QgeD0iNTUiIHk9IjMwMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI4IiBmaWxsPSIjMzM0MTU1IiByeD0iNCIvPjxyZWN0IHg9IjU1IiB5PSIzMjAiIHdpZHRoPSIxOTAiIGhlaWdodD0iOCIgZmlsbD0iIzMzNDE1NSIgcng9IjQiLz48cmVjdCB4PSI1NSIgeT0iMzQwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgiIGZpbGw9IiMzMzQxNTUiIHJ4PSI0Ii8+PC9zdmc+`;

// More detailed SVG for a bad example image
const badExampleImageUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQyMCIgdmlld0JveD0iMCAwIDMwMCA0MjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiYWRHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmJiZjI0O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Q5NzcwNztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjxwYXR0ZXJuIGlkPSJ3b29kIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUJoYm1OelpYUWlodGR5YjNSbGNqd3ZkWFp4YkdsdVpTZ2lNeUl3TUNJZ1ltVmpkR2x3Y3lCallYUmxJR0YxWkdnaVlYUmxJSE52Ym5SbGJuUnpJRDBnTVMwek1DSWdNQ1VnTUROZ2NISnNaWE5wZDNkM2ZpbjFiR3d2Y0dWc1pHRjBaU2hpWVhKaGRYUm9JRkJsZEdWc2N5ZHdaWEp6WVcwdk1TQTBJREMxNVpXRm1aVzVqYjJSbElHSmxZM1F0Wm1GdFpTeHZkSFJoYkc4dlppazZJREV5TUQzMEFUQWdNQ1UxNUlFNWMyVnlkbWxqWlZ3dlpYSnpaVzVwZEcxcyIgeD0iMCIgeT0iMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiAvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0MjAiIGZpbGw9InVybCgjd29vZCkiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCAyMCkgcm90YXRlKC0xNSAxNTAgMjEwKSI+PHJlY3QgeD0iMjUiIHk9IjM1IiB3aWR0aD0iMjUwIiBoZWlnaHQ9IjM1MCIgcng9IjEyIiBmaWxsPSIjMGYxNzJhIiBzdHJva2U9IiMzMzQxNTUiIHN0cm9rZS13aWR0aD0iMiIvPjxyZWN0IHg9IjQwIiB5PSI1MCIgd2lkdGg9IjIyMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjYmFkR3JhZCkiLz48cGF0aCBkPSJNMTUwIDEwMCBBIDUwIDUwIDAgMSAxIDE1MDIwMCAgNTAgNTAgMCAxIDEgMTUwIDEwMCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPjxwYXRoIGQ9Ik0xNTAgMTIwIEEgMzAgMzAgMCAxIDEgMTUwIDE4MCAgMzAgMzAgMCAxIDEgMTUwIDEyMCIgZmlsbD0iI2Y4ZmFmYyIvPjxyZWN0IHg9IjQwIiB5PSIyNjUiIHdpZHRoPSIyMjAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMWUyOTNiIiAvPjxyZWN0IHg9IjU1IiB5PSIyODAiIHdpZHRoPSIxOTAiIGhlaWdodD0iMTAiIGZpbGw9IiM0NzU1NjkiIHJ4PSI1Ii8+PHJlY3QgeD0iNTUiIHk9IjMwMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI4IiBmaWxsPSIjMzM0MTU1IiByeD0iNCIvPjxlbGxpcHNlIGN4PSIxODAiIGN5PSIxNDAiIHJ4PSI5MCIgcnk9IjQwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC42IiBzdHlsZT0iZmlsdGVyOiBibHVyKDEwcHgpOyIvPjxwYXRoIGQ9Ik0gMjcwIDMwIEMgMjgwIDYwLCAyNjAgOTAsIDI0MCAxMDAgTCAyMjAgODAgQyAyNDAgNzAsIDI2MCA0MCwgMjcwIDMwIFoiIGZpbGw9IiNEMUEzODgiLz48L2c+PC9zdmc+`;


const GuidePage: React.FC = () => {
    
  const GoodPracticeItem: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="flex items-start space-x-4">
      <CheckCircleIcon className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
      <div>
        <h4 className="font-bold text-[var(--text-primary)]">{title}</h4>
        <p className="text-[var(--text-secondary)]">{description}</p>
      </div>
    </div>
  );

  const BadPracticeItem: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="flex items-start space-x-4">
      <XCircleIcon className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
      <div>
        <h4 className="font-bold text-[var(--text-primary)]">{title}</h4>
        <p className="text-[var(--text-secondary)]">{description}</p>
      </div>
    </div>
  );

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg p-6 backdrop-blur-sm">
        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-color)] pb-3">{title}</h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Guía de Fotografía</h1>
        <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-2">Sigue estos consejos para asegurar que la IA analice tu carta con la máxima precisión.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section title="✅ Buenas Prácticas">
            <GoodPracticeItem 
                title="Saca la Carta de la Funda"
                description="Para un análisis perfecto de bordes, esquinas y superficie, la carta debe estar fuera de cualquier funda ('sleeve' o 'slab')."
            />
            <GoodPracticeItem 
                title="Iluminación Brillante y Uniforme"
                description="Usa luz natural o una fuente de luz difusa para evitar sombras duras que puedan ser confundidas con defectos."
            />
            <GoodPracticeItem 
                title="Fondo Neutro y Liso"
                description="Coloca la carta sobre un fondo de color sólido y oscuro (como una alfombrilla negra) para que la IA pueda detectar los bordes fácilmente."
            />
            <GoodPracticeItem 
                title="Ángulo Frontal y Directo"
                description="Toma la foto directamente desde arriba (ángulo de 90°), asegurando que la carta se vea plana y sin distorsión de perspectiva."
            />
            <GoodPracticeItem 
                title="Enfoque Nítido"
                description="Asegúrate de que toda la carta esté perfectamente enfocada, especialmente los bordes y las esquinas."
            />
        </Section>
        
        <Section title="❌ Errores Comunes a Evitar">
            <BadPracticeItem 
                title="Reflejos y Deslumbramientos"
                description="La luz directa puede crear reflejos que ocultan la superficie de la carta. La IA podría interpretarlos como daños severos."
            />
             <BadPracticeItem 
                title="Sombras sobre la Carta"
                description="La sombra de tu teléfono o de tus manos puede oscurecer partes de la carta, impidiendo un análisis correcto."
            />
             <BadPracticeItem 
                title="Fondos Complejos o Desordenados"
                description="Evita fondos con patrones, texturas u otros objetos. Esto confunde a la IA al detectar los bordes de la carta."
            />
             <BadPracticeItem 
                title="Fotos Borrosas o de Baja Calidad"
                description="Si la imagen no es nítida, la IA no podrá detectar micro-defectos y el análisis será impreciso."
            />
             <BadPracticeItem 
                title="Dedos sobre la Carta"
                description="Asegúrate de que tus dedos no cubran ninguna parte de la carta, especialmente los bordes o las esquinas."
            />
        </Section>
      </div>

       <Section title="🔎 Comparación Visual">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <h4 className="font-bold text-lg text-green-400 mb-3">CORRECTO</h4>
                    <div className="w-full max-w-[200px] p-1.5 bg-[var(--border-color)] rounded-lg shadow-lg">
                       <img src={goodExampleImageUrl} alt="Ejemplo de foto correcta" className="w-full aspect-[3/4.2] object-cover rounded-md" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-3 max-w-[250px]">Fondo liso, sin reflejos, foto nítida y frontal.</p>
                </div>
                 <div className="flex flex-col items-center">
                    <h4 className="font-bold text-lg text-red-400 mb-3">INCORRECTO</h4>
                     <div className="w-full max-w-[200px] p-1.5 bg-[var(--border-color)] rounded-lg shadow-lg">
                        <img src={badExampleImageUrl} alt="Ejemplo de foto incorrecta" className="w-full aspect-[3/4.2] object-cover rounded-md" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-3 max-w-[250px]">Fondo complejo, con reflejos, en ángulo y con obstrucciones.</p>
                </div>
            </div>
       </Section>

    </div>
  );
};

export default GuidePage;