import React from 'react';
import style from './styles.module.scss';

function Button() {
  return <button className={`${style.click} ${style.btn2}`}>Click me</button>;
}

export default Button;
