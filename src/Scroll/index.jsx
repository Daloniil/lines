import React, {useEffect} from 'react';

const useScrollDetect = (startScrollingCb, endScrollingCb, debounceTime = 1, delayTime = 1) => {
    let isScrolling;

    const debouncedFunc = (func, delay) => {
        let inDebounce;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(inDebounce);
            inDebounce = setTimeout(() => func.apply(context, args), delay);
        };
    };

    useEffect(() => {
        const handleScroll = debouncedFunc(() => {
            clearTimeout(isScrolling);
            startScrollingCb();

            isScrolling = setTimeout(() => {
                endScrollingCb();
            }, delayTime);
        }, debounceTime);

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [startScrollingCb, endScrollingCb, debounceTime, delayTime, debouncedFunc]);
};

export default useScrollDetect;