# XcelTutors Documentation

**[XcelTutors](https://www.xceltutors.com)** is an online platform that connects students with tutors, making lesson booking easy. The platform earns a small fee from each lesson and supports sessions across different timezones, with integrated interactive learning through Lessonspace.

## Core Features

- **Tutor Search**: Easily find tutors based on subjects, qualifications, and availability.
- **Timezone Flexibility**: Schedule lessons across timezones (e.g., a student in London can book a Thursday lesson with a tutor in Shanghai, even if it's already Friday there).
- **Interactive Lessons**: Integrated with [Lessonspace](https://www.lessonspace.com) for real-time, interactive learning.
- **Payments**: Secure payments via Stripe.

---

## Entities

### User

Represents users in the system, either a tutor or a student.

- **Type**: Tutor or student.
- **Country Code**: Numeric code (NUM-3) based on ISO-3166 standards.

  **Examples**:
  - `620`: Portugal
  - `826`: United Kingdom
  - `156`: China
  - `840`: United States
  - `250`: France

### Roles

Defines the user's role within the system.

- **Name**: Describes the role's name (e.g., Super Admin, Admin, Moderator).

---

## Learning Systems

A **Learning System** represents a specific educational framework or curriculum. Each system contains various subjects, and some subjects offer multiple qualification levels.

### Examples of Learning Systems

- **International Baccalaureate (IB)**
  - **Subjects**: Mathematics, Physics, Chemistry, English Literature, History
- **Portuguese National Curriculum**
  - **Subjects**: Matemática, Física, Biologia, Português, Geografia
- **US Common Core**
  - **Subjects**: English Language Arts, Algebra, Geometry, US History, Chemistry
- **British Curriculum: GCSE**
  - **Subjects**: Mathematics, Science, English Language, History, Geography
- **British Curriculum: A-Level**
  - **Subjects**: Mathematics, Physics, Chemistry, Economics, Psychology
- **French Baccalauréat**
  - **Subjects**: French Literature, Philosophy, Mathematics, Physics, History-Geography

---

## Subjects and Qualifications

Within each learning system, specific subjects are offered. Each subject can have different qualifications (or levels), which define the proficiency or certification a student achieves in that subject.

### Subject Breakdown

#### Mathematics

- **International Baccalaureate (IB)**
  - Higher Level Mathematics
  - Standard Level Mathematics
- **US Common Core**
  - Algebra I
  - Algebra II
  - Geometry
- **GCSE**
  - GCSE Mathematics
- **A-Level**
  - A-Level Mathematics

#### Matemática

- **Portuguese National Curriculum**
  - Matemática (9º Ano)
  - Matemática A (Secundário)
  - Matemática B (Secundário)

#### Physics

- **International Baccalaureate (IB)**
  - Higher Level Physics
  - Standard Level Physics
- **US Common Core**
  - Physics (11th Grade)
- **GCSE**
  - GCSE Physics
- **A-Level**
  - A-Level Physics

#### Física

- **Portuguese National Curriculum**
  - Física (Secundário)

#### English Literature

- **International Baccalaureate (IB)**
  - Standard Level English Literature
  - Higher Level English Literature
- **GCSE**
  - GCSE English Literature
- **A-Level**
  - A-Level English Literature

#### Chemistry

- **International Baccalaureate (IB)**
  - Higher Level Chemistry
- **US Common Core**
  - Chemistry (11th Grade)
- **GCSE**
  - GCSE Chemistry
- **A-Level**
  - A-Level Chemistry

#### Química

- **Portuguese National Curriculum**
  - Química (Secundário)

#### History

- **International Baccalaureate (IB)**
  - IB History
- **GCSE**
  - GCSE History
- **A-Level**
  - A-Level History

#### História

- **Portuguese National Curriculum**
  - História (Secundário)

#### Histoire

- **French Baccalauréat**
  - Histoire-Géographie

---

## Contact

For any questions or further details, please visit us at **[XcelTutors](https://www.xceltutors.com)** or contact us at **hello@xceltutors.com**.

---

This README provides an overview of XcelTutors' core features, Lessonspace integration, and detailed descriptions of learning systems, subjects, and qualifications supported by the platform.
