import { Brain } from "lucide-react";

const Navbar = () => {

    return (

        <header
            className="
                mb-8
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-white/10
                bg-[#111827]
                px-8
                py-5
                shadow-lg
            "
        >

            <div className="flex items-center gap-3">

                <Brain
                    size={32}
                    className="text-violet-400"
                />

                <h1
                    className="
                        text-2xl
                        font-bold
                        tracking-wide
                    "
                >

                    Passion Journal AI

                </h1>

            </div>

            <div
                className="
                    rounded-full
                    bg-violet-500/10
                    px-5
                    py-2
                    text-sm
                    font-medium
                    text-violet-300
                "
            >

                Track • Reflect • Grow

            </div>

        </header>

    );

};

export default Navbar;