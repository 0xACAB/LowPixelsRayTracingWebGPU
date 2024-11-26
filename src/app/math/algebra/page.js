import React from 'react';
import Link from 'next/link';
import SpoilerForSolution from '@/components/SpoilerForSolution';

export default function Page() {
	return (<>
		<div className={`flex items-left flex-col`}><Link href="/math">Назад к листкам</Link></div>
		<div className="text-right">
			Ссылка на курс: <a href="https://old.mccme.ru/ium//f23/f23-Algebra1.html">{'Алгебра'}</a>
		</div>

		<h3 className="text-center mt-3 text-xl tracking-tight font-bold text-gray-900">Листок 1</h3>
		<h3 className="text-center text-base tracking-tight font-semibold text-gray-900">Кольца вычетов</h3>
		<p className="indent-8 m-1"><span className="font-bold">Задача 1.</span> Приведите пример бинарной операции на
			множестве, удовлетворяющей всем аксиомам
			абелевой группы, кроме:
		</p>

		<p>
			<span className="font-bold">а)</span> ассоциативности; <span className="font-bold">б)</span> существования
			нейтрального и обратного элемента;
		</p>
		<p>
			<span className="font-bold">в)</span> существования обратного элемента; <span
			className="font-bold">г)</span> коммутативности.
		</p>
		<p>
			<span className="font-bold">д)</span> Приведите пример пары бинарных операций на множестве, для которой
			выполнены все аксиомы
			кольца, кроме дистрибутивности.
		</p>

		<SpoilerForSolution>Пусто2</SpoilerForSolution>
	</>);
}