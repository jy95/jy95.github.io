import { useState, useRef } from "react";
import type { ImgHTMLAttributes/*, CSSProperties*/ } from "react";

import Skeleton from '@mui/material/Skeleton';
// TODO Probably same styles that Skeleton
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

// @ts-ignore
import { useIntersection } from "../../hooks/useIntersection.tsx";

// Type props
interface PropsLazyImage {
    // Link for src 
    imagePath: string,
    // alt for image
    title: string,
    // Props for images
    propsImage?: ImgHTMLAttributes<HTMLImageElement>
}

type loadingStatus = 'loading' | 'error' | 'loaded';

function LazyImage(props : PropsLazyImage) {

    const [ isInView, setIsInView ] = useState(false);
    const [ imageStatus, setImageStatus ] = useState("loading" as loadingStatus);
    const { imagePath, title, propsImage = {}} = props;

    const imgRef = useRef();
    useIntersection(imgRef, () => {
        setIsInView(true);
    });
    // CSSProperties

    return <div
        ref={imgRef as any}
        className="image-container"
    >
        { (imageStatus === "error") && <BrokenImageIcon />}
        { !isInView && (imageStatus === "loading") && <Skeleton variant="rectangular"/> }
        { isInView && (
            <img
                src={imagePath}
                alt={title}
                onError={() => setImageStatus("error")}
                onLoad={() => setImageStatus("loaded")}
                style={{
                    width: "100%"
                }}
                // Extra image attributes
                {...propsImage}
            />
        )}
    </div>
}

export default LazyImage;