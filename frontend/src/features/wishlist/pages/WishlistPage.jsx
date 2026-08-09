import {
    useEffect,
    useState,
} from "react";

import {
    Heart,
} from "lucide-react";

import {
    getWishlist,
    toggleWishlist,
} from "../api/wishlist";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

export default function WishlistPage() {

    const [wishlist,setWishlist]=useState([]);

    const [loading,setLoading]=useState(true);

    useEffect(()=>{

        loadWishlist();

    },[]);

    async function loadWishlist(){

        try{

            const {data}=await getWishlist();

            setWishlist(data);

        }

        finally{

            setLoading(false);

        }

    }

    async function remove(id){

        await toggleWishlist(id);

        setWishlist(prev=>

            prev.filter(

                item=>

                item.product.id!==id

            )

        );

        toast.success(
            "Removed from wishlist"
        );

    }

    if(loading){

        return(
            <div className="py-32 text-center">
                Loading...
            </div>
        );

    }

    if(!wishlist.length){

        return(

            <section className="py-32 text-center">

                <Heart
                    size={60}
                    className="mx-auto text-zinc-300"
                />

                <h2 className="mt-6 text-3xl font-bold">

                    Wishlist Empty

                </h2>

            </section>

        );

    }

    return(

<section className="mx-auto max-w-7xl px-4 py-12">

<h1 className="mb-10 text-4xl font-black">

Wishlist

</h1>

<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

{

wishlist.map(item=>(

<div

key={item.id}

className="rounded-2xl border-gray-300 bg-white shadow transition hover:shadow-lg"

>

<Link

to={`/products/${item.product.slug}`}

>

<img

src={item.product.image_url}

className="aspect-square w-full rounded-t-2xl object-cover"

/>

</Link>

<div className="p-5">

<h2 className="font-bold">

{item.product.name}

</h2>

<p className="mt-2">

₹

{

item.product.discount_price ??

item.product.price

}

</p>

<button

onClick={()=>remove(item.product.id)}

className="mt-5 w-full rounded-xl border py-3 color-red-500 text-red-500 transition hover:bg-red-500 hover:text-white"

>

Remove

</button>

</div>

</div>

))

}

</div>

</section>

    );

}