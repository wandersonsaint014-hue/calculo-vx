import { describe, expect, it } from 'vitest'
import { exploreLimit, riemann, integrate, derivative } from './engine'

describe('Limites: regressões da referência Lovable',()=>{
  it('não transforma divergência de 1/x² em número finito',()=>expect(exploreLimit('1/x^2','0').value).toContain('+∞'))
  it('separa comportamentos laterais de 1/x',()=>expect(exploreLimit('1/x','0').value).toContain('esquerda −∞; direita +∞'))
  it('reconhece oscilação sem inventar limites laterais',()=>expect(exploreLimit('sin(1/x)','0').value).toContain('oscilação'))
  it('explica limite notável',()=>expect(exploreLimit('sin(x)/x','0').value).toContain('1 ('))
  it('explica salto de abs(x)/x',()=>expect(exploreLimit('abs(x)/x','0').value).toContain('esquerda −1; direita 1'))
  it('não generaliza por fragmentos da expressão',()=>expect(exploreLimit('1/x^2+1','0').value).toContain('Inconclusivo'))
  it('não reutiliza regra fora do ponto zero',()=>expect(exploreLimit('1/x^2','2').value).toContain('Inconclusivo'))
  it('rotula tabelas como amostras',()=>expect(exploreLimit('x^2','0').steps.join(' ')).toContain('não limites laterais'))
})
describe('Somas de Riemann',()=>{
  it('ponto médio com quatro retângulos dá 21/64 para x²',()=>expect(Number(riemann('x^2','0','1',4).value)).toBeCloseTo(21/64,12))
  it('esquerda e direita de x em [0,1]',()=>{
    expect(Number(riemann('x','0','1',4,'left').value)).toBe(.375)
    expect(Number(riemann('x','0','1',4,'right').value)).toBe(.625)
  })
  it('preserva orientação',()=>expect(Number(riemann('x','1','0',4).value)).toBe(-.5))
  it('recusa configurações inválidas',()=>{
    for(const n of [0,1,201,2.5]) expect(()=>riemann('x','0','1',n)).toThrow()
    expect(()=>riemann('x','0','1',8,'invalid')).toThrow()
  })
})
describe('Revisão das integrais',()=>{
  it('detecta polo linear fora da malha antiga',()=>expect(()=>integrate('1/(x-0.12345)','0','1')).toThrow('denominador zera'))
  it('detecta denominador quadrático',()=>expect(()=>integrate('1/(x^2-0.25)','0','1')).toThrow('denominador zera'))
  it('detecta potência negativa com polo',()=>expect(()=>integrate('(x-0.12345)^(-2)','0','1')).toThrow())
  it('permite denominador sem raízes reais',()=>expect(Number(integrate('1/(1+x^2)','0','1').value)).toBeCloseTo(Math.PI/4,10))
  it('preserva sinal da integral invertida',()=>expect(Number(integrate('x^2','1','0').value)).toBeCloseTo(-1/3,10))
  it('informa comparação e ausência de garantia de erro',()=>expect(integrate('x^2','0','1').steps.join(' ')).toContain('Não é uma garantia de erro'))
  it('mostra cada ordem derivada solicitada',()=>expect(derivative('x^4',3).steps.join(' ')).toContain('ordem 2'))
})
