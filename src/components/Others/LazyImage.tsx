import { useState, Suspense } from "react";
import type { ImgHTMLAttributes/*, CSSProperties*/ } from "react";

import Skeleton from '@mui/material/Skeleton';
import { SkeletonProps } from '@mui/material/Skeleton';

// Type props
interface PropsLazyImage {
    // Link for src 
    imagePath: string,
    // alt for image
    title: string,
    // Props for images
    propsImage?: ImgHTMLAttributes<HTMLImageElement>
    // Props for placeholder
    propsPlaceholder: SkeletonProps
}

type loadingStatus = 'loading' | 'error' | 'loaded';

function LazyImage(props : PropsLazyImage) {

    const [ imageStatus, setImageStatus ] = useState("loading" as loadingStatus);
    const { imagePath, title, propsImage = {}, propsPlaceholder} = props;

    return <Suspense fallback={<Skeleton variant="rectangular" {...propsPlaceholder} />}>
        <img
            src={imagePath}
            alt={title}
            loading={"lazy"}
            onError={() => setImageStatus("error")}
            onLoad={() => setImageStatus("loaded")}
            // Extra image attributes
            {...propsImage}
        />
    </Suspense>
}

export default LazyImage;