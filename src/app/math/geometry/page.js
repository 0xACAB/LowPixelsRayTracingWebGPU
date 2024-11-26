import React from 'react';
import Link from 'next/link';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import SpoilerForSolution from '@/components/SpoilerForSolution';

export default function Page() {
	return (<>
		<div className={`flex items-left flex-col`}><Link href="/math">Назад к листкам</Link></div>

		<h2
			className="text-center text-2xl tracking-tight font-bold text-gray-900 sm:text-2xl md:text-2xl">ГЕОМЕТРИЯ</h2>

		<div className="text-right">
			Ссылка на курс: <a href="https://old.mccme.ru/ium//f23/f23-Geometry.html">{'Геометрия'}</a>
		</div>

		<h3 className="text-center mt-3 text-xl tracking-tight font-bold text-gray-900">Листок 1</h3>

		<h3 className="text-center text-base tracking-tight font-semibold text-gray-900">Метрика, геометрия в смысле
			Клейна, группы симметрий фигур</h3>
		<p className="indent-8 m-1">Чтобы сдать этот листок необходимо решить хотя бы 5 задач. При этом задачи со
			звёздочкой
			приравниваются
			к двум задачам без звёздочки. В задаче 4 каждый пункт считается
			за отдельную задачу. Однако, сдача более двух задач или одной задачи со звёздочкой из задачи
			4 не даст дополнительных баллов.</p>
		<p className="indent-8 m-1"><span className="font-bold">1.</span> а) Докажите что формула</p>
		<p className="indent-8 m-1 text-center">
			<Latex
				macros={{ '\\f': '#1d(#2)' }}>{'$\\f\\relax{x,y} = \\displaystyle\\max_{i=1,...,n}|x_i-y_i|,$'}</Latex>
		</p>
		<p>
			где
			&nbsp;<Latex>{'$x = (x_1,...,x_n), y = (y_1,...,y_n) \\in \\R^n,$'}</Latex>&nbsp;
			задает метрику в
			&nbsp;<Latex>{'$\\R^n.$'}</Latex>&nbsp;
			Нарисуйте примеры открытых и замкнутых шаров радиуса
			&nbsp;<Latex>{'$\\varepsilon$'}</Latex>&nbsp;
			с центром в
			&nbsp;<Latex>{'$(0,0)$'}</Latex>&nbsp;
			на
			&nbsp;<Latex>{'$\\R^2.$'}</Latex>&nbsp;
			с этой метрикой.
		</p>
		<p className="indent-8 m-1">
			б) Пусть
			&nbsp;<Latex>{'$M$'}</Latex>&nbsp;
			— некоторое множество. Зададим функцию
			расстояния
			&nbsp;<Latex>{'$d: M × M \\rightarrow \\R$'}</Latex>&nbsp;
			следующим образом: для любых
			&nbsp;<Latex>{'$x \\not = y$'}</Latex>&nbsp;
			положим
			&nbsp;<Latex macros={{ '\\f': '#1d(#2)' }}>{'$\\f\\relax{x,y} = 1$'}</Latex>&nbsp;
			и
			&nbsp;<Latex macros={{ '\\f': '#1d(#2)' }}>{'$\\f\\relax{x,x} = 0$'}</Latex>&nbsp;
			Покажите, что
			&nbsp;<Latex>{'$(M, d)$'}</Latex>&nbsp;
			является метрическим пространством. Опишите открытые шары радиуса
			&nbsp;<Latex>{'$\\varepsilon$'}</Latex>&nbsp;
			с центром в некоторой точке этого пространства.
		</p>
		<SpoilerForSolution>Пусто1</SpoilerForSolution>
	</>);
}