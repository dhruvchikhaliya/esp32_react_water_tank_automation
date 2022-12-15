import React, { useRef, useEffect, useContext, Dispatch, SetStateAction, useState } from 'react';

export interface LayoutContextValue {
  title: string;
  setTitle: (title: string) => void;
}

const LayoutContextDefaultValue = {} as LayoutContextValue;
export const LayoutContext = React.createContext(
  LayoutContextDefaultValue
);


export const changeModeContext = React.createContext<any>("");
export const useLayoutTitle = (myTitle: string) => {

  const { title, setTitle } = useContext(LayoutContext);
  const previousTitle = useRef(title);

  useEffect(() => {
    setTitle(myTitle);
  }, [setTitle, myTitle]);

  useEffect(() => () => {
    setTitle(previousTitle.current);
  }, [setTitle]);

};
