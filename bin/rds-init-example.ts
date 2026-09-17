#!/usr/bin/env node

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib'
import { RdsInitStackExample } from '../demos/rds-init-example'

const app = new cdk.App()

/* eslint no-new: 0 */
const rds_init_stack = new RdsInitStackExample(app, 'RdsInitExample')
cdk.Tags.of(rds_init_stack).add('aws-apn-id', 'pc:9yq38ki5jw5mas7jhjthpgveo')
