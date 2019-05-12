#! /usr/bin/env node

import '@babel/polyfill';
import mailer from 'nodemailer';
import Puppeteer from 'puppeteer-core';
import { getNPMConfig } from '@tech_query/node-toolkit';
import express from 'express';

const app = express();

const transport = mailer.createTransport({
    service: 'qq',
    secureConnection: true,
    secure: true,
    port: 456,
    auth: {
        user: 'sender mail',
        pass: 'key'
    }
});

const options = {
    from: 'sender mail',
    to: 'reciever mail',
    subject: 'Puppeteer - 猫片',
    html: htmlContent
};

let htmlContent = '';

(async () => {
    const browser = await Puppeteer.launch({
        executablePath: getNPMConfig('chrome')
    });
    // 打开一个新的页面
    const page = await browser.newPage();
    // 打开的页面跳转到指定URL
    await page.goto('https://space.bilibili.com/9008159/dynamic');
    // 等到指定DOM节点加载完毕后，获取DOM信息
    await page.waitForSelector('.s-space .zoom-list');
    const content = await page.$$eval('.s-space .zoom-list .card', items =>
        items.map(
            item =>
                item
                    .querySelector('.img-content')
                    .style.backgroundImage.split('"')[1]
        )
    );

    // console.info(content);

    htmlContent = content.reduce((acc, cur) => {
        acc += `<div><img style='height: 100px' src='${cur}' alt='' /></div>`;
        return acc;
    }, '');
})();

app.get('/', function() {
    transport.sendMail(options, function(err, info) {
        console.info('Enter sendMail.');
        if (err) console.warn('Send mail failed.');
        else console.info(info);
    });
});

app.listen(8888, function() {
    console.info('Node server start success.');
});
