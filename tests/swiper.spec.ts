/**
 * @file swiper.spec.ts 对应 swiper.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.01
 */

import {Swiper} from '../src/swiper';

describe('test swiper', () => {
    document.body.innerHTML = '<div class="outer-container" style="width: 400px; height: 650px;"></div>';

    const data = [{
        content: '<img src="//kityminder-img.cdn.bcebos.com/01.png" alt="01" width="100%" height="100%">'
    }, {
        content: '<img src="//kityminder-img.cdn.bcebos.com/02.png" alt="02" width="100%" height="100%">'
    }, {
        content: '<img src="//kityminder-img.cdn.bcebos.com/03.png" alt="03" width="100%" height="100%">'
    }];

    const mockStartPoint = {
        X: 100,
        Y: 100
    };

    const mockUpMovingPoint = {
        X: 100,
        Y: 90
    };

    const mockDownMovingPoint = {
        X: 100,
        Y: 110
    };

    let swiper;

    beforeEach(() => {
        swiper = new Swiper({
            container: <HTMLElement>document.querySelector('.outer-container'),
            data: data,
            initIndex: 1,
            keepDefaultClass: ['keep-default']
        });
    });

    describe('test preventDefaultHandler', () => {

        test('test a device event on a tag', () => {
            const mockDeviceEventOnATag = {
                target: document.createElement('a'),
                preventDefault: jest.fn();
            };

            swiper.keepDefaultHandler(mockDeviceEventOnATag);
            expect(mockDeviceEventOnATag.preventDefault).toHaveBeenCalledTimes(0);
        });

        test('test a device event on a keep default element', () => {
            const $targetElement = document.createElement('div');
            $targetElement.classList.add('keep-default');

            const mockDeviceEventOnKeepDefault = {
                target: $targetElement,
                preventDefault: jest.fn();
            };

            swiper.keepDefaultHandler(mockDeviceEventOnKeepDefault);
            expect(mockDeviceEventOnKeepDefault.preventDefault).toHaveBeenCalledTimes(0);
        });

        test('test a device event on a normal element', () => {
            const mockDeviceEventOnNormal = {
                target: document.createElement('div'),
                preventDefault: jest.fn()
            };

            swiper.keepDefaultHandler(mockDeviceEventOnNormal);
            expect(mockDeviceEventOnNormal.preventDefault).toHaveBeenCalledTimes(1);
        });
    });

    describe('test touchStartHandler', () => {
        test('test a touch start event', () => {
            const mockTouchStartPoint = {
                X: 100,
                Y: 100
            };

            swiper.startHandler(mockTouchStartPoint);
            expect(swiper.start.X).toBe(100);
            expect(swiper.start.Y).toBe(100);
        });

        test('test prevent touch start when sliding', () => {
            swiper.sliding = true;

            const mockTouchStartPoint = {
                X: 100,
                Y: 100
            };

            swiper.startHandler(mockTouchStartPoint);

            expect(swiper.moving).toBe(false);
        });
    });


    describe('test moveHandler', () => {
        test('test a up moving event', () => {
            // mock swiper.fire
            swiper.fire = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockUpMovingPoint);

            expect(swiper.offset.X).toBe(0);
            expect(swiper.offset.Y).toBe(-10);
            expect(swiper.pageChange).toBe(true);

            expect(swiper.fire).toHaveBeenCalledWith('swipeChange');
            expect(swiper.fire).toHaveBeenCalledWith('swipeStart');
        });

        test('test a down moving event', () => {
            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);
            expect(swiper.offset.X).toBe(0);
            expect(swiper.offset.Y).toBe(10);
        });

        test('test a none moving event', () => {

            const mockNoneMovingPoint = mockStartPoint;

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockNoneMovingPoint);
            expect(swiper.offset.X).toBe(0);
            expect(swiper.offset.Y).toBe(0);
        });

        test('test a reverse up to down moving event', () => {
            swiper.fire = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockUpMovingPoint);
            swiper.moveHandler(mockDownMovingPoint);

            expect(swiper.fire).toHaveBeenCalledWith('activePageChanged');
        });

        test('test moving event when sliding', () => {
            swiper.sliding = true;
            swiper.fire = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockUpMovingPoint);
            expect(swiper.fire).toHaveBeenCalledTimes(0);
        });

        test('test a near edge moving event', () => {
            swiper.endHandler = jest.fn();

            const mockNearEdgePoint = {
                X: 100,
                Y: 10
            }

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockNearEdgePoint);
            expect(swiper.endHandler).toBeCalled();
        });

        test('test duration 0 in moving event', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data,
                transition: {
                    name: 'slide',
                    duration: 0
                }
            });

            swiper.render = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockUpMovingPoint);

            expect(swiper.render).toHaveBeenCalledTimes(0);
        });

        test('test activePage EMPTY in moving event', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data
            });

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);

            expect(swiper.offset.Y).toBe(0);
            expect(swiper.start).toEqual(mockDownMovingPoint);
            expect(swiper.pageChange).toBe(false);
        });

        test('test page forbidden in moving event', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data,
                initIndex: 1,
                transition: {
                    name: 'slide',
                    duration: 0,
                    direction: 0
                }
            });

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);

            expect(swiper.offset.Y).toBe(0);
            expect(swiper.start).toEqual(mockDownMovingPoint);
        });

        test('test page down forbidden in moving event', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data,
                initIndex: 1,
                transition: {
                    name: 'slide',
                    duration: 0,
                    direction: -1
                }
            });

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);

            expect(swiper.offset.Y).toBe(0);
            expect(swiper.start).toEqual(mockDownMovingPoint);
        });
    });

    describe('test endHandler', () => {
        test('test touchEnd event when sliding', () => {
            swiper.sliding = true;

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockUpMovingPoint);
            swiper.endHandler();

            expect(swiper.endTime).toBeUndefined();
        });

        test('test if offset is 0 when activePage is EMPTY', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data
            });

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);
            swiper.endHandler();

            expect(swiper.offset.Y).toBe(0);
        });

        test('page change in moving greater than threshold', () => {
            const mockLargeDownMovingEvent = {
                X: 100,
                Y: 400
            };

            swiper._swipeTo = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockLargeDownMovingEvent);
            swiper.endHandler();

            expect(swiper.pageChange).toBe(true);
            expect(swiper._swipeTo).toBeCalled();
        });

        test('page change in moving less than threshold', () => {
            swiper._swipeTo = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);
            swiper.endHandler();

            expect(swiper.moveDirection).toBe(-1);
            expect(swiper.pageChange).toBe(false);
            expect(swiper._swipeTo).toBeCalled();
        });
    });

    describe('test swipeTo', () => {
        
        test('test swipe to next page', () => {
            swiper._swipeTo = jest.fn();

            swiper.swipeTo(2);

            expect(swiper.moveDirection).toBe(-1);
            expect(swiper.pageChange).toBeTruthy();
            expect(swiper._swipeTo).toBeCalled();
        });

        test('test swipe to prev page', () => {
            swiper._swipeTo = jest.fn();

            swiper.swipeTo(0);

            expect(swiper.moveDirection).toBe(1);
            expect(swiper.pageChange).toBeTruthy();
            expect(swiper._swipeTo).toBeCalled();
        });

        test('test swipe to current page', () => {
            swiper._swipeTo = jest.fn();

            swiper.swipeTo(1);

            expect(swiper.moveDirection).toBe(0);
            expect(swiper.pageChange).toBeFalsy();
            expect(swiper._swipeTo).toBeCalled();
        });

        test('test swipe to a index out of range', () => {
            swiper._swipeTo = jest.fn();

            swiper.swipeTo(-1);

            expect(swiper.moveDirection).toBe(0);
            expect(swiper.pageChange).toBeFalsy();
            expect(swiper.activePage).toMatchObject(document.createElement('div'));
            expect(swiper._swipeTo).toBeCalled();
        });

        test('test swipe to a index in a loop swiper', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data,
                initIndex: 1,
                isLoop: true
            });

            swiper._swipeTo = jest.fn();

            swiper.swipeTo(-1);

            expect(swiper.moveDirection).toBe(1);
            expect(swiper.pageChange).toBeTruthy();
            expect(swiper.activePage).toEqual(swiper.$pages[2])
            expect(swiper._swipeTo).toBeCalled();
        });
    });

    describe('test _swipeTo', () => {
        test('test _swipeTo when sliding', () => {
            swiper.sliding = true;
            window.requestAnimationFrame = jest.fn();
            
            swiper._swipeTo();
            expect(window.requestAnimationFrame).toHaveBeenCalledTimes(0);
        });
    });

});