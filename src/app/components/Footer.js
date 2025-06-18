'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Linkedin,
    Instagram,
    Github,
    Code2,
} from 'lucide-react';
import BounceInBottom from './BounceInBottom';
import BounceInTop from './BounceInTop';

const Footer = () => {
    return (
        <BounceInTop>
            <div className="w-full flex justify-center mt-20">
                <div className="flex flex-col  items-center space-y-10 px-4 py-10 w-full border-blue-950 bg-background/0 z-10">
                    {/* Navigation Links */}
                    {/* <nav className="flex flex-wrap justify-center gap-6 text-muted-foreground font-medium">
          <Link href="/" className="hover:text-foreground transition-colors">Requests</Link>
          <Link href="/paymentsection" className="hover:text-foreground transition-colors">Payments</Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        </nav> */}
                    {/* Social Icons */}
                    <div className="flex justify-center space-x-6 text-gray-500">
                        {/* LeetCode */}
                        <Link href="https://leetcode.com/u/Jackkkkkk/" target="_blank">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png"
                                alt="LeetCode"
                                className="w-6 h-6 hover:scale-110 transition-transform"
                            />
                        </Link>
                        {/* LinkedIn */}
                        <Link href="https://www.linkedin.com/in/neeraj-salunkhe-542826255" target="_blank">
                            <Linkedin className="w-6 h-6 hover:text-blue-500 transition-colors" />
                        </Link>

                        {/* Instagram */}
                        <Link href="https://www.instagram.com/_neeraj_2607/" target="_blank">
                            <Instagram className="w-6 h-6 hover:text-pink-500 transition-colors" />
                        </Link>

                        {/* GitHub */}
                        <Link href="https://github.com/NeerajSalunkhe" target="_blank">
                            <Github className="w-6 h-6 hover:text-foreground transition-colors" />
                        </Link>

                        {/* Codeforces */}
                        <Link href="https://codeforces.com/profile/Jackkk" target="_blank">
                            <Code2 className="w-6 h-6 hover:text-purple-600 transition-colors" />
                        </Link>
                    </div>

                    {/* Copyright */}
                    <p className="text-center text-muted-foreground font-medium">
                        &copy; {new Date().getFullYear()} HelpShare
                    </p>
                </div>
            </div>
        </BounceInTop>
    );
};

export default Footer;
