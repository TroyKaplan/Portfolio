import { useState, useEffect } from 'react';
import logger from '../utils/logger';

export const useDeviceInfo = () => {
    const [deviceClass, setDeviceClass] = useState('standard');

    useEffect(() => {
        const detectDevice = async () => {
            const deviceInfo = {
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio,
                orientation: window.orientation,
                userAgent: navigator.userAgent
            };

            logger.log('debug', 'DeviceDetection', 'Raw device info:', deviceInfo);

            let newDeviceClass = 'standard';
            if (deviceInfo.width >= 1920 && deviceInfo.pixelRatio > 1) {
                newDeviceClass = 'high-res';
            } else if (deviceInfo.width >= 1200) {
                newDeviceClass = 'standard';
            } else if (deviceInfo.width >= 768) {
                newDeviceClass = 'tablet';
            } else {
                newDeviceClass = deviceInfo.orientation === 90 ? 'mobile-landscape' : 'mobile';
            }

            logger.log('info', 'DeviceDetection', 'Device class determined:', {
                class: newDeviceClass,
                criteria: {
                    width: deviceInfo.width,
                    height: deviceInfo.height,
                    pixelRatio: deviceInfo.pixelRatio,
                    orientation: deviceInfo.orientation
                }
            });

            setDeviceClass(newDeviceClass);
        };

        detectDevice();
        window.addEventListener('resize', detectDevice);
        window.addEventListener('orientationchange', detectDevice);

        return () => {
            window.removeEventListener('resize', detectDevice);
            window.removeEventListener('orientationchange', detectDevice);
        };
    }, []);

    return deviceClass;
};