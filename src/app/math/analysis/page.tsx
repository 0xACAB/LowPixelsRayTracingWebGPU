import React from 'react';
import Link from 'next/link';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import SpoilerForSolution from '@/components/SpoilerForSolution';

export default function Page() {
	return (<>
		<div className={`flex items-left flex-col`}><Link href="/math">Назад к листкам</Link></div>
		<div className="text-right">
			Ссылка на курс: <a href="https://old.mccme.ru/ium//f22/f22-Calculus-1.html">{'Анализ'}</a>
		</div>

		<h3 className="text-center mt-3 text-xl tracking-tight font-bold text-gray-900">Листок 1</h3>
		<p className="indent-8 m-1">
			<span className="font-bold">Задача 1. </span>
			Пусть <Latex>{'$A \\Delta B = (A \\backslash B) ∪ (B \\backslash A)$'}</Latex>. Докажите,
			что множество <Latex>{'$2^X$'}</Latex>,
			состоящее из всех подмножеств множества <Latex>{'$X$'}</Latex>,
			с операцией <Latex>{'$\\Delta$'}</Latex> является абелевой группой.
		</p>
		<SpoilerForSolution>Пусто1</SpoilerForSolution>
	</>);
}