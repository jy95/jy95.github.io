import { useEffect } from 'react';
import type { RefObject } from "react";

let listenerCallbacks = new WeakMap();

let observer;

function handleIntersections(entries) {
  entries.forEach(entry => {
    if (listenerCallbacks.has(entry.target)) {
      let cb = listenerCallbacks.get(entry.target);

      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        observer.unobserve(entry.target);
        listenerCallbacks.delete(entry.target);
        cb();
      }
    }
  });
}

function getIntersectionObserver(options : IntersectionObserverInit) {
  if (observer === undefined) {
    observer = new IntersectionObserver(handleIntersections, options);
  }
  return observer;
}

export function useIntersection(
  elem : RefObject<any>, 
  callback, 
  options = {
    rootMargin: '100px',
    threshold: 0.15,
  } as IntersectionObserverInit
) {
  useEffect(() => {
    let target = elem.current;
    let observer = getIntersectionObserver(options);
    listenerCallbacks.set(target, callback);
    observer.observe(target);

    return () => {
      listenerCallbacks.delete(target);
      observer.unobserve(target);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}